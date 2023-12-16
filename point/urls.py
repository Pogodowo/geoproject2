from django.urls import path

from . import views



urlpatterns = [
path('', views.home,name='home'),
path('places_data/', views.places_dataset, name='my_places'),
path('accounts/profile/',views.profile,)
]