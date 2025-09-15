class UserRepository {
    constructor(UserModel) {
        this.User = UserModel;
    };

    async create(data) {
        return this.User.create(data);
    };

    async findAll() {
        return this.User.find();
    };

    async findById(id) {
        return this.User.findOne({ _id: id });
    };

    async updateById(id, data) {
        return this.User.replaceOne({ _id: id }, data);
    };

    async deleteById(id) {
        return this.User.deleteOne({ _id: id });
    };

    async findByEmail(email) {
        return this.User.findByEmail(email);
    };
};