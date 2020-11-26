import React, { useEffect, createContext } from 'react';
import { useWeb3Context } from 'web3-react';

export const ConnectorContext = createContext();

export default function ConnectorProvider(props) {
  const context = useWeb3Context();
  useEffect(() => context.setFirstValidConnector(['MetaMask']), [context]);
  const { children } = props;
  return <ConnectorContext.Provider value={{ context }}>{children}</ConnectorContext.Provider>;
}
