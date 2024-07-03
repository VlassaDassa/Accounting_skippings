from django.contrib import admin
from . import models



admin.site.register(models.Group)
admin.site.register(models.Student)
admin.site.register(models.Period)
admin.site.register(models.Skipping)
admin.site.register(models.Manager)