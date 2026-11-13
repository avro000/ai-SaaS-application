import History from '../models/History.js';

export const getHistory = async (req, res, next) => {
  try {
    const { toolType, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (toolType) query.toolType = toolType;

    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-input -output');

    const total = await History.countDocuments(query);

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoryItem = async (req, res, next) => {
  try {
    const item = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'History item not found' });
    res.json({ item });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const item = await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'History item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const toolUsage = await History.aggregate([
      { $match: { userId } },
      { $group: { _id: '$toolType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const dailyUsage = await History.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const totalItems = await History.countDocuments({ userId });
    const recentActivity = await History.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('toolType title createdAt');

    res.json({
      toolUsage,
      dailyUsage: dailyUsage.reverse(),
      totalItems,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
