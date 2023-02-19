import type { FC, PropsWithChildren } from 'react';

interface LayoutProps extends PropsWithChildren {}

const Layout: FC<LayoutProps> = ({ children }) => {
  return <main>{children}</main>;
};

export default Layout;
