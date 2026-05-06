from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is None:
        return Response(
            {
                'success': False,
                'error': {'detail': 'Internal server error'},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            'success': False,
            'error': response.data,
        },
        status=response.status_code,
    )
