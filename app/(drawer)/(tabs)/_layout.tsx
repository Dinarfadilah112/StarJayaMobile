import CustomTabBar from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      detachInactiveScreens={false} // Ensure tabs stay mounted/rendered
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
        }}
      />
      <Tabs.Screen
        name="gudang"
        options={{
          title: 'Gudang',
        }}
      />
      <Tabs.Screen
        name="kasir"
        options={{
          title: 'Kasir',
        }}
      />
      <Tabs.Screen
        name="penjualan"
        options={{
          title: 'Pembukuan',
        }}
      />
      <Tabs.Screen
        name="options"
        options={{
          title: 'Pengaturan',
        }}
      />

    </Tabs>
  );
}
