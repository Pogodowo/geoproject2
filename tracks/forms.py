from django import forms

from .models import  GPXTrack

class gpxForm(forms.ModelForm):
    class Meta:
        model=GPXTrack
        fields=['name','track']
        widgets = {
            'track': forms.FileInput(attrs={'accept': '.gpx'}),
        }