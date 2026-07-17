def detect_intent(query):

 query = query.lower()

 if any(word in query for word in [
    "cgpa",
    "gpa",
    "target cgpa"
]):
    return "cgpa"

 elif any(word in query for word in [
    "credit hour",
    "graduation",
    "degree requirement",
    "degree"
]):
    return "degree"

 elif any(word in query for word in [
    "scholarship",
    "financial aid"
]):
    return "scholarship"

 elif any(word in query for word in [
    "admission",
    "apply",
    "eligibility",
    "merit"
]):
    return "admission"

 elif any(word in query for word in [
    "fee",
    "tuition",
    "charges",
    "cost"
]):
    return "fee"

 elif any(word in query for word in [
    "attendance"
]):
    return "attendance"

 elif any(word in query for word in [
    "hostel"
]):
    return "hostel"

 elif any(word in query for word in [
    "exam",
    "midterm",
    "final"
]):
    return "exam"

 return "general"

