class ProfileManager:

    def __init__(self):

        self.profile = {}

    def set_profile(
        self,
        data
    ):

        self.profile.update(data)

    def get_profile(self):

        return self.profile

    def clear(self):

        self.profile = {}


profile_manager = ProfileManager()