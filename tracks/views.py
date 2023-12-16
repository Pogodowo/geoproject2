from django.shortcuts import render,redirect
from .models import GPXTrack
from django.http import HttpResponse,JsonResponse,response
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
import sys
from . import forms
from io import StringIO
# Create your views here.
import gpxpy
from django.contrib.gis.geos import Point,LineString
from .models import GPXTrack
import random
import re
from django.db import transaction

def get_random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))


# def load_gpx(file_path):
#     with open(file_path, 'r') as gpx_file:
#         gpx_data = gpxpy.parse(gpx_file)
#         for track in gpx_data.tracks:
#             track_points = [(point.longitude, point.latitude) for point in track.segments[0].points]
#             track_line = LineString(track_points)
#             gpx_track = GPXTrack(name=track.name, track=track_line,color=get_random_color())
#             gpx_track.save()



# Usage
#load_gpx(r'C:\projekty\geodjango\geo\geoproject\tracks\gpx_directory\narew.gpx')



# def add_track(request):
#     if request.method == 'POST': #and request.FILES.get('product_description'):
#         uploaded_file = request.FILES['product_description']
#         with open('trasy', 'wb+') as destination:
#             for chunk in uploaded_file.chunks():
#                 destination.write(chunk)
#         load_gpx( r'C:\projekty\geodjango\geo\geoproject\trasy' )
#         #return JsonResponse({'message': 'File uploaded successfully'})
#         tracks = GPXTrack.objects.all()
#         serialized_tracks = serialize('geojson', tracks)
#         return HttpResponse(serialized_tracks, content_type='json')
#
#     return JsonResponse({'error': 'Invalid request'})
def load_gpx(gpx_file,user,name,color):
    gpx_data = gpxpy.parse(gpx_file)
    for track in gpx_data.tracks:
        track_points = [(point.longitude, point.latitude) for point in track.segments[0].points]
        track_line = LineString(track_points)
        if name!='':
            name=name
        else:
            name=track.name
        match = re.search(r'^#(?:[0-9a-fA-F]{3}){1,2}$', color)
        if match:
            color=color
        else:
            color=get_random_color()
        gpx_track = GPXTrack(name=name,owner=user ,track=track_line,color=color)
        gpx_track.save()
def add_track(request):
    if request.method == 'POST': #and request.FILES.get('product_description'):
        uploaded_file = request.FILES['gpx_track']
        name=request.POST['track_title']
        color=request.POST['track_color']
        gpx_content = uploaded_file.read().decode('utf-8')
        load_gpx(gpx_content,request.user,name,color)
        return JsonResponse({'message': 'File uploaded successfully'})
    return JsonResponse({'error': 'Invalid request'})

def edit_track_form(request,pk):
    edited_track= GPXTrack.objects.filter(pk=pk)
    serialized_track = serialize('geojson', edited_track)
    return HttpResponse(serialized_track, content_type='json')

def save_changes(request,pk):
    edited_track = GPXTrack.objects.get(pk=pk)

    if request.method == 'POST':  # and request.FILES.get('product_description'):
        name = request.POST["name-edit"]
        color = request.POST["track-color-edit"]


        #track=edited_track.track
        edited_track.name=name
        edited_track.color=color
        if 'gpx-track-edit' in request.FILES:
            uploaded_file = request.FILES['gpx-track-edit']
            gpx_content = uploaded_file.read().decode('utf-8')
            track_line=None
            gpx_data = gpxpy.parse(gpx_content)
            for track in gpx_data.tracks:
                track_points = [(point.longitude, point.latitude) for point in track.segments[0].points]
                track_line = LineString(track_points)
            edited_track.track=track_line
            edited_track.save()
        edited_track.save()
        return JsonResponse({'message': 'File uploaded successfully'})
    return JsonResponse({'error': 'Invalid request'})

def delete_track(request ,pk):
    try:
        edited_track = GPXTrack.objects.get(pk=pk)
        edited_track.delete()
        return JsonResponse({'message': 'Track deleted successfully'})
    except GPXTrack.DoesNotExist:
        return JsonResponse({'error': 'Track not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def tracks_dataset(request):
    tracks = GPXTrack.objects.filter(owner=request.user).order_by('pk')
    serialized_tracks = serialize('geojson', tracks)
    return HttpResponse(serialized_tracks, content_type='json')