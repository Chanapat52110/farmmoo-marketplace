from rest_framework.response import Response


def api_success(data=None, status_code=200):
    return Response({
        'success': True,
        'data': data,
    }, status=status_code)
