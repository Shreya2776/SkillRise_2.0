import('./src/models/User.js').then(async userModule => {
  const User = userModule.default;
  import('mongoose').then(async m => {
    await m.default.connect('mongodb+srv://yadavjhalak3211_db_user:sankalp26@cluster0.fgiyffq.mongodb.net/mern-auth');
    await User.updateOne({ email: 'admin@skillrise.com' }, { $set: { password: '$2b$10$vuAwD5bxxpXvIu0UiQSNPeWYemXG97tMEfYBUEOYcDqWVcafSHXSO' } }, { runValidators: false });
    await User.updateOne({ email: 'harshvardhanchauhan719@gmail.com' }, { $set: { password: '$2b$10$Z8lBdXuZ2J5xaS.2rOgBVuYoO6nZBgrpmyJbNybYzZNNBR3KUb8a.' } }, { runValidators: false });
    console.log('Reverted successfully via updateOne!');
    process.exit(0);
  }).catch(console.error)
}).catch(console.error);
