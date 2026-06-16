from rest_framework import serializers
from .models import ContactInquiry


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ["id", "name", "phone", "email", "investor_type", "topic", "message", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if not attrs.get("phone") and not attrs.get("email"):
            raise serializers.ValidationError("请至少填写一种联系方式（电话或邮箱）。")
        if len(attrs.get("message", "").strip()) < 5:
            raise serializers.ValidationError({"message": "咨询内容请至少填写 5 个字。"})
        return attrs
