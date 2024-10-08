const prisma = require("../prismaClient");

const addFeature = async (req, res) => {
  try {
    const { feature_name } = req.body;
    if (!feature_name) {
      return res.status(501).json({ error: "Provide the necessary data!" });
    }

    // Convert feature_name to lowercase for case-insensitive check
    const normalizedFeatureName = feature_name.toLowerCase();

    const existingFeature = await prisma.feature.findFirst({
      where: {
        feature_name: {
          equals: normalizedFeatureName,
        },
      },
    });

    if (existingFeature) {
      return res.status(409).json({ message: "Feature name already exists!" });
    }

    // Create new feature with normalized name
    const featuresData = await prisma.feature.create({
      data: {
        feature_name: feature_name,
      },
    });

    return res
      .status(201)
      .json({ message: "Successfully added the feature!", featuresData });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      error: "Failed to add the new feature!",
    });
  }
};

const deleteFeature = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const featureData = await prisma.feature.findUnique({
      where: {
        feature_id: id,
      },
    });
    if (!featureData) {
      return res.status(201).json({ message: "features not found! " });
    }
    const deleteData = await prisma.feature.delete({
      where: {
        feature_id: id,
      },
    });

    return res
      .status(201)
      .json({ message: "successfully deleted the features ! " });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      error: "Failed to delete the new feature!",
    });
  }
};

const getFeature = async (req, res) => {
  try {
    const feature = await prisma.feature.findMany({});
    return res.status(201).json({ feature: feature });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      error: "Failed to get the new feature!",
    });
  }
};

module.exports = {
  addFeature,
  deleteFeature,
  getFeature,
};
