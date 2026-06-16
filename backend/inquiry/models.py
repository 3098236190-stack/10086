from django.db import models


class ContactInquiry(models.Model):
    INVESTOR_CHOICES = [("beginner", "理财小白"), ("advanced", "进阶基民")]
    TOPIC_CHOICES = [
        ("getstarted", "新手入门咨询"),
        ("product", "基金/产品咨询"),
        ("strategy", "投资策略咨询"),
        ("complaint", "投诉与建议"),
        ("other", "其他"),
    ]
    STATUS_CHOICES = [("pending", "待处理"), ("processing", "处理中"), ("done", "已回复")]

    name = models.CharField("姓名/称呼", max_length=40)
    phone = models.CharField("联系电话", max_length=20, blank=True)
    email = models.EmailField("邮箱", blank=True)
    investor_type = models.CharField("用户类型", max_length=10, choices=INVESTOR_CHOICES, default="beginner")
    topic = models.CharField("咨询主题", max_length=20, choices=TOPIC_CHOICES, default="getstarted")
    message = models.TextField("咨询内容")

    status = models.CharField("处理状态", max_length=10, choices=STATUS_CHOICES, default="pending")
    handle_note = models.TextField("处理备注", blank=True)
    created_at = models.DateTimeField("提交时间", auto_now_add=True)

    class Meta:
        verbose_name = "用户咨询"
        verbose_name_plural = "用户咨询"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} · {self.get_topic_display()}"
