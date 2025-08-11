from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import QuizSubmission

# Create your views here.
@api_view(['GET', 'POST'])
def submit_quiz(request):
    data = request.data

    username = data.get('username', 'Anonymous')
    points = data.get('points', 0)  # Number of correct answers, expected from frontend
    attempted_count = data.get('attempted_count', 0)
    total_time_taken = data.get('total_time_taken', 0)

    QuizSubmission.objects.create(
        username=username,
        points=points,
        attempted_count=attempted_count,
        total_time_taken=total_time_taken,
    )

    return Response({"message": "Quiz submitted successfully"}, status=status.HTTP_201_CREATED)