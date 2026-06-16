from datetime import datetime, date

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from funds.models import Fund, FundManager, MarketIndex, Sector
from funds.seed_data import INDICES, SECTORS, FUNDS
from content.models import EduArticle, Strategy, News
from content.seed_data import EDU, STRATEGIES, NEWS

REFERENCE = date(2026, 6, 16)


class Command(BaseCommand):
    help = "写入演示真实数据（基金/经理/指数/板块/投教/策略/资讯），幂等可重复执行。"

    @transaction.atomic
    def handle(self, *args, **options):
        for idx in INDICES:
            MarketIndex.objects.update_or_create(code=idx["code"], defaults=idx)
        for s in SECTORS:
            Sector.objects.update_or_create(name=s["name"], defaults=s)

        for i, f in enumerate(FUNDS):
            inception = datetime.strptime(f["inception"], "%Y-%m-%d").date()
            age = max(0.5, (REFERENCE - inception).days / 365.25)
            since = f["ret"]["since"]
            manager, _ = FundManager.objects.update_or_create(
                name=f["manager"],
                defaults={
                    "years": max(1, round(age) + i % 3),
                    "annual_return": round(((1 + since / 100) ** (1 / age) - 1) * 100, 1),
                    "funds_count": 2 + i % 5,
                    "bio": f"{f['manager']}，证券从业多年，注重在控制回撤的前提下追求长期稳健回报。（演示文案）",
                },
            )
            r, alloc, fee = f["ret"], f["alloc"], f["fees"]
            Fund.objects.update_or_create(
                code=f["code"],
                defaults={
                    "name": f["name"], "ftype": f["ftype"], "risk": f["risk"], "company": f["company"],
                    "manager": manager, "direction": f["direction"], "appetite": f["appetite"],
                    "scale": f["scale"], "inception_date": inception,
                    "nav": f["nav"], "acc_nav": f["acc_nav"], "day_change": f["day"],
                    "r_w1": r["w1"], "r_m1": r["m1"], "r_m3": r["m3"], "r_m6": r["m6"],
                    "r_y1": r["y1"], "r_y3": r["y3"], "r_y5": r["y5"], "r_since": r["since"],
                    "rank_pct": f["rank"], "mdd": f["mdd"], "sharpe": f["sharpe"], "vol": f["vol"],
                    "down_risk": f["down_risk"], "info_ratio": f["info"], "tags": f["tags"],
                    "alloc_stock": alloc[0], "alloc_bond": alloc[1], "alloc_cash": alloc[2],
                    "fee_sub": fee[0], "fee_red": fee[1], "fee_manage": fee[2],
                    "fee_custody": fee[3], "fee_confirm": fee[4], "fee_arrive": fee[5],
                    "holdings": f["holdings"], "industries": f["industries"],
                },
            )

        for slug, level, cat, title, excerpt, read, key, order, body in EDU:
            EduArticle.objects.update_or_create(
                slug=slug,
                defaults={"level": level, "category": cat, "title": title, "excerpt": excerpt,
                          "read_time": read, "key_point": key, "order": order, "body": body},
            )
        for slug, level, title, suit, framework, risk, order in STRATEGIES:
            Strategy.objects.update_or_create(
                slug=slug,
                defaults={"level": level, "title": title, "suit": suit,
                          "framework": framework, "risk": risk, "order": order},
            )
        for cat, tag, title, when in NEWS:
            dt = timezone.make_aware(datetime.strptime(when, "%Y-%m-%d %H:%M"))
            News.objects.update_or_create(
                title=title, defaults={"category": cat, "tag": tag, "published_at": dt})

        User = get_user_model()
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin12345")
            self.stdout.write("已创建后台管理员 admin / admin12345")

        self.stdout.write(self.style.SUCCESS(
            f"种子数据完成：基金 {Fund.objects.count()} · 经理 {FundManager.objects.count()} · "
            f"指数 {MarketIndex.objects.count()} · 板块 {Sector.objects.count()} · "
            f"投教 {EduArticle.objects.count()} · 策略 {Strategy.objects.count()} · 资讯 {News.objects.count()}"
        ))
