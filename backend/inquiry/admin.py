from django.contrib import admin

from .models import ContactInquiry


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "topic", "investor_type", "contact", "status", "created_at"]
    list_filter = ["status", "topic", "investor_type", "created_at"]
    search_fields = ["name", "phone", "email", "message"]
    list_editable = ["status"]
    readonly_fields = ["name", "phone", "email", "investor_type", "topic", "message", "created_at"]
    fieldsets = (
        ("用户提交内容（只读）", {"fields": ("name", ("phone", "email"), "investor_type", "topic", "message", "created_at")}),
        ("处理", {"fields": ("status", "handle_note")}),
    )

    @admin.display(description="联系方式")
    def contact(self, obj):
        return obj.phone or obj.email or "—"

    def has_add_permission(self, request):
        return False  # 咨询仅由前台表单产生
