from django.shortcuts import render
from allauth.account.forms import LoginForm
from django.views import generic # django generic view
from django.contrib.gis.geos import fromstr, Point #to get our longitude and latitude
from django.views.generic.edit import FormView
from django.contrib.gis.db.models.functions import Distance #distance between us and fav places
from .models import Location
from .forms import MyLoginForm
from django.http import HttpResponse
from django.core.serializers import serialize
from django.contrib.gis.geos import GEOSException,LineString
from tracks.forms import gpxForm
from tracks.models import GPXTrack
import gpxpy
import sys

longitude = -80.191788

latitude = 25.761681



my_location = Point(longitude, latitude, srid=4326) #default location we will use gps geolocation in future totorials.




def load_gpx(file,user):
    try:
        gpx_data = gpxpy.parse(file)
        for track in gpx_data.tracks:
            track_points = [(point.longitude, point.latitude) for point in track.segments[0].points]
            track_line = LineString(track_points)
            gpx_track = GPXTrack(name=track.name, track=track_line, owner=user, color='#000000')
            gpx_track.save()
    except Exception as e:
        print(f"Error loading GPX: {e}")

def home(request):
    if request.method == 'POST':
        # If form is submitted
        form = LoginForm(request.POST)
        if form.is_valid():
            # Process form data if valid
            # For example, authenticate the user
            pass  # Replace with your logic
    else:
        # If it's a GET request, display the login form
        form = LoginForm()
    return render(request, 'home.html',{'form': form} )

def profile(request):
    tracks_list=GPXTrack.objects.all()
    return render(request, 'profile.html', {'tracks': tracks_list})




def places_dataset(request):
    place = serialize('geojson', Location.objects.all())
    return HttpResponse(place, content_type='json')