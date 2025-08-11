from django.contrib import admin
from .models import QuizSubmission

# Register your models here.
@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ('username', 'points', 'attempted_count', 'total_time_taken', 'submitted_at')
    search_fields = ('username',)
    list_filter = ('submitted_at',)