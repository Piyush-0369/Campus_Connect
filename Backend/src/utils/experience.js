const addExperience = async (Model, parentId, expData) => {
  return await Model.findByIdAndUpdate(
    parentId,
    { $push: { experience: expData } },
    { new: true, runValidators: true }
  ).select("-password_hash -refreshToken -faceEmbedding");
};

const getExperiences = async (Model, parentId) => {
  const doc = await Model.findById(parentId).select("experience");
  return doc ? doc.experience : null;
};

const updateExperience = async (Model, parentId, expId, updates) => {
  const updatesWithId = { ...updates, _id: expId };
  return await Model.findOneAndUpdate(
    { _id: parentId, "experience._id": expId },
    { $set: { "experience.$": updatesWithId } },
    { new: true, runValidators: true }
  ).select("-password_hash -refreshToken -faceEmbedding");
};

const deleteExperience = async (Model, parentId, expId) => {
  return await Model.findByIdAndUpdate(
    parentId,
    { $pull: { experience: { _id: expId } } },
    { new: true }
  ).select("-password_hash -refreshToken -faceEmbedding");
};

export {
    addExperience,
    getExperiences,
    updateExperience,
    deleteExperience
}
