from django.urls import path

from . import views



urlpatterns = [
#path('', views.Home.as_view()),
path('tracks_data/', views.tracks_dataset, name='my_tracks'),
path('dodaj_trase/', views.add_track, name='dodaj-trase'),
path('edytuj_trase_form/<int:pk>/', views.edit_track_form, name='edytuj-trase_form'),
path('save_changes/<int:pk>/',views.save_changes, name='save-changes'),
path('delete_track/<int:pk>/',views.delete_track, name='delete_track'),

]