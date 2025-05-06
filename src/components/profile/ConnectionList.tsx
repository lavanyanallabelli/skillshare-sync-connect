
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import ConnectionsList from "./connection/ConnectionsList";
import RequestsList from "./connection/RequestsList";
import RemoveConnectionDialog from "./connection/RemoveConnectionDialog";

const ConnectionList: React.FC = () => {
  return (
    <ConnectionProvider>
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections">
            <TabsList className="mb-4">
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections">
              <ConnectionsList />
            </TabsContent>
            
            <TabsContent value="requests">
              <RequestsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <RemoveConnectionDialog />
    </ConnectionProvider>
  );
};

export default ConnectionList;
