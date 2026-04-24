let Users = new Map<string, string>();
const addUser = (uuid: string, socketId: string) => {
  if (Users.has(uuid)) {
    Users.delete(uuid);
  }
  Users.set(uuid, socketId);
};
const removeUser = (socketId: string) => {
  Users.forEach((value, key) => {
    if (value == socketId) {
      Users.delete(key);

      return;
    }
  });
};
const getuuid = (socketId: string) => {
  for (const [key, value] of Users) {
    if (value === socketId) return key;
  }
  return null;
};
const getSocketId = (uuid: string) => {
  if (Users.has(uuid)) {
    return Users.get(uuid);
  } else {
    return null;
  }
};

export { addUser, getSocketId, removeUser, getuuid };
