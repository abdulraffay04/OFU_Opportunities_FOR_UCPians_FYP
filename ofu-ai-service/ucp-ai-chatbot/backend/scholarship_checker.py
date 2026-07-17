from academic_advisor import advisor


class ScholarshipChecker:

    def get_scholarships(self):

        return advisor.search_policy(
            "scholarship policy merit scholarship financial aid"
        )


checker = ScholarshipChecker()