class CGPACalculator:

    def calculate_required_gpa(
        self,
        current_cgpa,
        completed_credits,
        target_cgpa,
        total_credits
    ):

        remaining = (
            total_credits -
            completed_credits
        )

        if remaining <= 0:
            return None

        current_points = (
            current_cgpa *
            completed_credits
        )

        target_points = (
            target_cgpa *
            total_credits
        )

        needed_points = (
            target_points -
            current_points
        )

        required = (
            needed_points /
            remaining
        )

        return round(
            required,
            2
        )


calculator = CGPACalculator()