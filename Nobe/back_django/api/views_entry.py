import functools
import operator

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Entry, Image
from .serializers import EntrySerializer, ImageSerializer
from .permissions import IsGetOrHasToken

from django.db.models import Max, Min, Q
from django.http import HttpResponse, JsonResponse


# -------------------------- #
#        ENTRY views
# -------------------------- #


# GET | POST
class EntryView(APIView):
    parser_classes = (MultiPartParser, JSONParser)
    permission_classes = (IsGetOrHasToken,)

    def get(self, request):

        page = request.GET.get('page', '')
        page_size = request.GET.get('page_size', '')

        order_by_year = request.GET.get('order_year', '')
        order_by_author = request.GET.get('order_author', '')
        order_by_title = request.GET.get('order_title', '')

        order_by_created = request.GET.get('order_created', '')

        from_year = request.GET.get('from_year', '')
        to_year = request.GET.get('to_year', '')
        author = request.GET.get('author', '')
        q = request.GET.get('q', '')

        page = 0 if not page else int(page)
        page_size = 5 if not page_size else int(page_size)

        # Img ids containing the found text
        image_ids = []

        entries = Entry.objects.all()

        if q:
            _q = q.split(" ")
            _q.append(q)
            query = functools.reduce(operator.or_, (Q(entry_images__text__unaccent__icontains=item) for item in _q))
            entries = entries.filter(query)

            # Get the img ids that correspond to the text found
            query = functools.reduce(operator.or_, (Q(text__unaccent__icontains=item) for item in _q))
            image_ids = Image.objects.filter(query).values_list('id', flat=True)

        # Pagination
        start = page * page_size
        stop = start + page_size

        # filters
        if from_year:
            entries = entries.filter(year__gte=from_year)

        if to_year:
            entries = entries.filter(year__lte=to_year)

        if author:
            entries = entries.filter(author__exact=author)

        # order by
        _order_by = []

        if order_by_created:
            _order_created = "created_at" if order_by_year.upper() == "ASCENDING" else "-created_at"
            _order_by.append(_order_created)

        if order_by_year:
            _order_year = "year" if order_by_year.upper() == "ASCENDING" else "-year"
            _order_by.append(_order_year)

        if order_by_author:
            _order_author = "author" if order_by_author.upper() == "ASCENDING" else "-author"
            _order_by.append(_order_author)

        if order_by_title:
            _order_title = "title" if order_by_title.upper() == "ASCENDING" else "-title"
        else:
            _order_title = "title"

        _order_by.append(_order_title)

        entries = entries.order_by(*_order_by)
        entries = entries.distinct()

        serializer = EntrySerializer(entries, many=True)

        return Response({"entries": serializer.data[start:stop], "total": len(serializer.data), "image_ids": image_ids})

    def post(self, request):
        data = request.data
        _images = dict(data.lists())['images']

        serializer = EntrySerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
        else:
            return Response(data={'error': "entry not valid"}, status=status.HTTP_400_BAD_REQUEST)

        entry = Entry.objects.filter(id=instance.id)

        if not entry:
            return Response(data={'error': "Error when saving entry to database"}, status=status.HTTP_404_NOT_FOUND)
        else:
            entry = entry[0]

        for image in _images:
            data = create_image_data(image, entry.id)
            img_serializer = ImageSerializer(data=data)
            if img_serializer.is_valid():
                img_serializer.save()
            else:
                return Response(data={f'error': f"image {image} not valid"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={'entry_id': entry.id}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes((IsAuthenticated, ))
def entry_detail(request, pk):
    """
    Retrieve, update or delete a code snippet.
    """
    try:
        entry = Entry.objects.get(pk=pk)
    except Entry.DoesNotExist:
        return HttpResponse(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EntrySerializer(entry)
        return JsonResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = EntrySerializer(entry, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        data = JSONParser().parse(request)
        if not data['title']:
            return Response(data={f'error': "Título necesario"}, status=status.HTTP_400_BAD_REQUEST)

        if not data['author']:
            return Response(data={f'error': "Autor necesario"}, status=status.HTTP_400_BAD_REQUEST)

        if not data['year']:
            return Response(data={f'error': "Año necesario"}, status=status.HTTP_400_BAD_REQUEST)

        entry = Entry.objects.all().filter(id=pk)

        if not entry:
            return Response(data={f'error': "Registro no encontrado"}, status=status.HTTP_400_BAD_REQUEST)

        entry = entry[0]
        entry.title = data['title']
        entry.author = data['author']
        entry.year = data['year']

        entry.save()

        return Response(data={}, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        entry.delete()
        return HttpResponse(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def entry_meta(request):
    entries = Entry.objects.all()
    min_year = entries.aggregate(Min('year'))['year__min']
    max_year = entries.aggregate(Max('year'))['year__max']
    authors = list(entries.values_list('author').distinct())

    return Response({"min_year": min_year,
                     "max_year": max_year,
                     "authors": authors
                     },
                    status=status.HTTP_200_OK)


@api_view(['PUT', 'POST'])
def image_update(request):

    if request.method == "POST":
        data = request.data
        data = dict(data.lists())

        if "entry_id" in data:
            entry_id = data['entry_id'][0]
        else:
            return Response(data={"ID de registro necesario"}, status=status.HTTP_400_BAD_REQUEST)

        if "images" in data:
            images = data['images']
        else:
            return Response(data={"Imagenes necesarias"}, status=status.HTTP_400_BAD_REQUEST)

        img_ids = []

        for image in images:
            data = create_image_data(image, int(entry_id))
            img_serializer = ImageSerializer(data=data)
            if img_serializer.is_valid():
                img_ids.append(img_serializer.save())
            else:
                return Response(data={f'error': f"image {image} not valid"}, status=status.HTTP_400_BAD_REQUEST)

        imgs_data = Image.objects.all().filter(id__in=[img.id for img in img_ids])
        serializer = ImageSerializer(imgs_data, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)

    if request.method == "PUT":
        data = JSONParser().parse(request)
        images = data['images']
        to_delete = data['to_delete']

        ids = [str(img['id']) for img in images]
        bd_images = Image.objects.all().filter(id__in=ids)

        for image in images:
            current_img = bd_images.filter(id=image['id'])[0]
            current_img.text = image['text']
            current_img.save(override=True)

        for img_id in to_delete:
            img = Image.objects.all().filter(id=img_id['id'])
            img.delete()

        return Response(data={}, status=status.HTTP_200_OK)


def create_image_data(image, entry):
    d = dict()
    d['image'] = image
    d['entry'] = entry
    return d
