'use client';
import React, { useState } from 'react';
import Groups from "./Groups";
import UnsignedUsers from "./UnsignedUsers";

function GroupsFunc() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  return (
    <>
      <Groups 
        refreshFlag={refreshFlag} 
        onUpdate={() => setRefreshFlag(prev => !prev)} 
      />
      <UnsignedUsers 
        refreshFlag={refreshFlag} 
        onUpdate={() => setRefreshFlag(prev => !prev)} 
      />
    </>
  );
}

export default GroupsFunc;