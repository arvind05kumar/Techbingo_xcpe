from django.db import models

# Create your models here.

class QuizSubmission(models.Model):
    username = models.CharField(max_length=100)  # Or use ForeignKey to User
    points = models.PositiveIntegerField()
    attempted_count = models.PositiveIntegerField()
    total_time_taken = models.PositiveIntegerField(help_text="Time in seconds")
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}"