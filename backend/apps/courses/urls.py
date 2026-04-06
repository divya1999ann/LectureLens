from django.urls import path
from .views import CourseListCreateView, CourseDetailView, CourseStudentsView, CourseStudentRemoveView

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<uuid:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('<uuid:course_id>/students/', CourseStudentsView.as_view(), name='course-students'),
    path('<uuid:course_id>/students/<uuid:student_id>/', CourseStudentRemoveView.as_view(), name='course-student-remove'),
]
