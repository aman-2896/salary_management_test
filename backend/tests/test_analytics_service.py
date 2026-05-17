from app.services import analytics_service


def test_salary_stats_returns_correct_min_max_avg(db, sample_employees):
    stats = analytics_service.get_salary_stats_by_country(db, "United States")

    assert stats["min_salary"] == 90_000   # Carol
    assert stats["max_salary"] == 140_000  # Bob
    assert stats["avg_salary"] == round((120_000 + 140_000 + 90_000) / 3, 2)
    assert stats["headcount"] == 3


def test_salary_stats_returns_zeros_for_unknown_country(db, sample_employees):
    stats = analytics_service.get_salary_stats_by_country(db, "Antarctica")
    assert stats["headcount"] == 0
    assert stats["avg_salary"] == 0


def test_avg_salary_by_job_title_in_country(db, sample_employees):
    results = analytics_service.get_avg_salary_by_job_title_in_country(
        db, "United States"
    )
    titles = [r["job_title"] for r in results]

    assert "Software Engineer" in titles
    assert "HR Manager" in titles

    se = next(r for r in results if r["job_title"] == "Software Engineer")
    assert se["avg_salary"] == round((120_000 + 140_000) / 2, 2)
    assert se["headcount"] == 2


def test_department_breakdown_includes_all_departments(db, sample_employees):
    results = analytics_service.get_department_breakdown(db)
    departments = [r["department"] for r in results]

    assert "Engineering" in departments
    assert "Human Resources" in departments
    assert "Product" in departments


def test_top_paid_roles_respects_limit(db, sample_employees):
    results = analytics_service.get_top_paid_job_titles(db, limit=2)
    assert len(results) <= 2


def test_top_paid_roles_ordered_by_avg_salary_desc(db, sample_employees):
    results = analytics_service.get_top_paid_job_titles(db, limit=10)
    salaries = [r["avg_salary"] for r in results]
    assert salaries == sorted(salaries, reverse=True)


def test_headcount_by_country(db, sample_employees):
    results = analytics_service.get_headcount_by_country(db)
    countries = {r["country"]: r["headcount"] for r in results}

    assert countries["United States"] == 3
    assert countries["United Kingdom"] == 2


def test_salary_percentiles_p50_is_median(db, sample_employees):
    # US salaries: 90k, 120k, 140k — median is 120k
    result = analytics_service.get_salary_percentile_bands(db, "United States")
    assert result["p50"] == 120_000
    assert result["total_employees"] == 3