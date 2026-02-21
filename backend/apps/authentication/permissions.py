from rest_framework import permissions


class IsTeacher(permissions.BasePermission):
    """Permission class to check if user is a teacher"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TEACHER'


class IsStudent(permissions.BasePermission):
    """Permission class to check if user is a student"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STUDENT'


class IsAdminUser(permissions.BasePermission):
    """Permission class to check if user is an admin"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsTeacherOrReadOnly(permissions.BasePermission):
    """Only teachers can create/update/delete, others can read"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'TEACHER'
