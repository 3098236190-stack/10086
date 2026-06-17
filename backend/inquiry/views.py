from rest_framework import mixins, viewsets, permissions

from .models import ContactInquiry
from .serializers import ContactInquirySerializer


class ContactInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """公开的「联系/咨询」表单提交入口（仅允许创建）。"""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [permissions.AllowAny]
