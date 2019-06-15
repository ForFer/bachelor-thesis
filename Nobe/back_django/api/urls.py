from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.documentation import include_docs_urls

from . import views_users, views_entry

router = routers.DefaultRouter()
router.register('user', views_users.UserView, base_name='user')

urlpatterns = [
    path('', include(router.urls)),

    path('entries/', views_entry.EntryView.as_view()),
    path('entry/<int:pk>/', views_entry.entry_detail),
    path('entry_meta/', views_entry.entry_meta),
    path('images/', views_entry.image_update),

    path('users/', views_users.UsersView.as_view(), name='users list'),

    path('login/', obtain_auth_token, name='api-token'),
    path('user_meta/', views_users.get_user_by_token),

    path('docs/', include_docs_urls(title='My API title')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
