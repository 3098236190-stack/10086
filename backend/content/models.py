from django.db import models

LEVEL_CHOICES = [("beginner", "小白入门"), ("advanced", "进阶提升")]


class EduArticle(models.Model):
    slug = models.CharField("编号", max_length=10, unique=True)
    level = models.CharField("梯队", max_length=10, choices=LEVEL_CHOICES)
    category = models.CharField("分类", max_length=20)
    title = models.CharField("标题", max_length=120)
    excerpt = models.CharField("摘要", max_length=200)
    read_time = models.CharField("阅读时长", max_length=10, default="5分钟")
    key_point = models.CharField("核心要点", max_length=200)
    body = models.TextField("正文(HTML)", blank=True)
    order = models.IntegerField("排序", default=0)

    class Meta:
        verbose_name = "投教文章"
        verbose_name_plural = "投教文章"
        ordering = ["level", "order"]

    def __str__(self):
        return self.title


class Strategy(models.Model):
    slug = models.CharField("编号", max_length=10, unique=True)
    level = models.CharField("类型", max_length=10, choices=LEVEL_CHOICES)
    title = models.CharField("标题", max_length=120)
    suit = models.CharField("适用人群", max_length=120)
    framework = models.JSONField("策略框架(步骤列表)", default=list)
    risk = models.CharField("风险点与局限", max_length=300)
    order = models.IntegerField("排序", default=0)

    class Meta:
        verbose_name = "投资策略"
        verbose_name_plural = "投资策略"
        ordering = ["level", "order"]

    def __str__(self):
        return self.title


class News(models.Model):
    CATEGORY_CHOICES = [
        ("industry", "行业要闻"),
        ("notice", "公司公告"),
        ("view", "观点解读"),
    ]
    category = models.CharField("栏目", max_length=10, choices=CATEGORY_CHOICES)
    tag = models.CharField("标签", max_length=10)
    title = models.CharField("标题", max_length=160)
    published_at = models.DateTimeField("发布时间")

    class Meta:
        verbose_name = "市场资讯"
        verbose_name_plural = "市场资讯"
        ordering = ["-published_at"]

    def __str__(self):
        return self.title
