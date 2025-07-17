const { User } = require("../model/user");
const connectDB = require("./db");
const usersJson = require("./users.json");

connectDB();

const DummyUser = async() => {
    const new_users = await User.create(usersJson);
    console.log("successfully register 10 users")
}
DummyUser();