

from django.contrib.gis.db import models
from django.contrib.auth.models import User

class GPXTrack(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    track = models.LineStringField()
    color = models.CharField(max_length=7, default='#000000')
    def __str__(self):
        return f"{self.name}"

