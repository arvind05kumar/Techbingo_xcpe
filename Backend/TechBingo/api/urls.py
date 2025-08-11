from django.urls import path
from . import views

urlpatterns = [
    path('submit_quiz/', views.submit_quiz),
]