export const ApiEndpoints = {
    NON_PBM: {
      STATUS: (providerId: number) =>
        `/RegulatorsAPI/j/ICP.svc/Dashboard_NonPBM_Status?SPROVIDERID=${providerId}`,
      ERRORS: (providerId: number) =>
        `/RegulatorsAPI/j/ICP.svc/Dashboard_NonPBM_Errors?SPROVIDERID=${providerId}`,
    },
  
    PBM: {
        DASHBOARD: (clientId: number, status: number): string =>
          `/PBMConnectAPI/j/PBMTxnDashBoard.svc/GET_PBM_TXN_NOTIFICATION_DASHBOARD?CLIENTID=${clientId}&STATUS=${status}`,
    },
   
  };
  