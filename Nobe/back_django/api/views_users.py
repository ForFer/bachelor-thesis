from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.authtoken.models import Token

from .serializers import UserDetailedSerializer, UserSerializer

from django.contrib.postgres.search import SearchVector
from django.contrib.auth.models import User

# -------------------------- #
#        USER views
# -------------------------- #

# POST | PUT | DELETE
class UserView(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, )
    parser_classes = (JSONParser,)
    queryset = User.objects.all()
    serializer_class = UserDetailedSerializer


# GET
class UsersView(APIView):
    parser_classes = (JSONParser,)
    permission_classes = (IsAuthenticated, )
    serializer_class = UserSerializer

    def get(self, request):

        page = request.GET.get('page', '')
        page_size = request.GET.get('page_size', '')

        q = request.GET.get('q', '')

        order_by_user = request.GET.get('order_username',)
        order_by_date_joined = request.GET.get('order_joined',)
        order_by_email = request.GET.get('order_email', )

        page = 0 if not page else int(page)
        page_size = 10 if not page_size else int(page_size)

        users = User.objects.all()

        # Pagination
        start = page * page_size
        stop = start + page_size

        if q:
            users = User.objects.annotate(
                        search=SearchVector('username', 'email'),
                    ).filter(search__icontains=q)
            # Equivalent to doing
            # User.objects.all().filter(Q(username__icontains=q) | Q(email__icontains=q))

        # order by
        _order_by = []

        if order_by_date_joined:
            print("Here, DATE JOINED")
            _order_by_date_joined = "date_joined" if order_by_date_joined.upper() == "ASCENDING" else "-date_joined"
            _order_by.append(_order_by_date_joined)
            print(_order_by)

        if order_by_email:
            _order_by_email = "email" if order_by_email.upper() == "ASCENDING" else "-email"
            _order_by.append(_order_by_email)

        if order_by_user:
            _order_by_user = "username" if order_by_user.upper() == "ASCENDING" else "-username"
            _order_by.append(_order_by_user)

        if not order_by_date_joined and not order_by_email and not order_by_user:
            _order_by_user = "username"
            _order_by.append(_order_by_user)

        users = users.order_by(*_order_by)
        users = users.distinct()

        serializer = UserSerializer(users, many=True)

        return Response({"users": serializer.data[start:stop], "total": len(serializer.data)})


@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def get_user_by_token(request):
    if request.method == 'GET':
        received_token = request.headers['Authorization']
        if received_token:
            received_token = received_token.split(" ")[1]
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        token = Token.objects.all().filter(key=received_token)

        if token:
            user_id = token[0].user_id
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

        user = User.objects.all().filter(id=user_id)
        if user:
            user = user[0]
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
