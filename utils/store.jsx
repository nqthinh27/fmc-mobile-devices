import { create } from 'zustand';

const useStore = create((set, get) => ({
  currentUser: null,
  setCurrentUser: user => set({ currentUser: user }),
  removeCurrentUser: () => set({ currentUser: null }),
  
  currentTokenDevice: null,
  setTokenDevice: token => set({ currentTokenDevice: token }),
  removeTokenDevice: () => set({ currentTokenDevice: null }),

  currentLoginInfo: null,
  setLoginInfo: info => set({ currentLoginInfo: info }),
  removeLoginInfo: () => set({ currentLoginInfo: null }),
  
  notificationList: ['thinh'],
  setNotificationList: (newNotification) => {
    set((state) => {
      const updatedList = [...state.notificationList, newNotification];
      if (updatedList.length > 5) {
        updatedList.shift();
      }
      return { notificationList: updatedList };
    });
  },
  removeNotificationList: () => set({ notificationList: [] }),
}));

export default useStore;