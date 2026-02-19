import SecurityGroup from "../models/securityGroup.js";

export const listSecurityGroups = async (req, res) => {
  try {
    const groups = await SecurityGroup.find({ owner: req.user.id });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching security groups" });
  }
};

export const createSecurityGroup = async (req, res) => {
  try {
    const { name, description, rules } = req.body;
    const group = await SecurityGroup.create({ name, description, rules: rules || [], owner: req.user.id });
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating security group" });
  }
};

export const updateSecurityGroup = async (req, res) => {
  try {
    const group = await SecurityGroup.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!group) return res.status(404).json({ msg: "Security group not found" });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating security group" });
  }
};

export const deleteSecurityGroup = async (req, res) => {
  try {
    const group = await SecurityGroup.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!group) return res.status(404).json({ msg: "Security group not found" });
    res.json({ msg: "Security group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting security group" });
  }
};
