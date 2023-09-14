    import React from 'react';
    import { createDrawerNavigator } from '@react-navigation/drawer';
    import GeneratePage from '../pages/GeneratePage';
    import ListPage from '../pages/ListPage';

    const Drawer = createDrawerNavigator();

    const NavBar: React.FC = () => {
      return (
        <Drawer.Navigator initialRouteName="GeneratePage">
          <Drawer.Screen name="GeneratePage" component={GeneratePage} />
          <Drawer.Screen name="ListPage" component={ListPage} />
        </Drawer.Navigator>
      );
    }

    export default NavBar;