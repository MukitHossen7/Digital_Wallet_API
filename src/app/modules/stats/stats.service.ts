import { User } from "../user/user.model";

const getAllUsersStatistics = async () => {
  const allUser = await User.find({ role: "USER" });
  const totalUsers = await User.countDocuments({ role: "USER" });
  const activeUsers = await User.countDocuments({
    isActive: "ACTIVE",
    role: "USER",
  });
  const blockUsers = await User.countDocuments({
    isActive: "BLOCKED",
    role: "USER",
  });
  return {
    totalUsers,
    activeUsers,
    blockUsers,
    userData: allUser,
  };
};

const getAllAgentStatistics = async () => {
  const allAgent = await User.find({ role: "AGENT" });
  const totalAgents = await User.countDocuments({ role: "AGENT" });
  const activeAgents = await User.countDocuments({
    isActive: "ACTIVE",
    role: "AGENT",
  });
  const blockAgents = await User.countDocuments({
    isActive: "SUSPENDED",
    role: "AGENT",
  });
  return {
    totalAgents,
    activeAgents,
    blockAgents,
    data: allAgent,
  };
};

export const StatsServices = {
  getAllUsersStatistics,
  getAllAgentStatistics,
};
