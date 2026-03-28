/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import BoardHeader from "@/src/components/board/BoardHeader";
import BoardClient from "@/src/components/board/BoardClient";

interface Props {
  board: any;
  allMembers: any[];
  allLabels: any[];
  searchQuery?: string;
}

export default function BoardPageClient({ board, allMembers, allLabels, searchQuery }: Props) {
  const [filterLabel, setFilterLabel] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [filterDue, setFilterDue] = useState("");

  const handleFilterChange = (filters: { label?: string; member?: string; due?: string }) => {
    setFilterLabel(filters.label || "");
    setFilterMember(filters.member || "");
    setFilterDue(filters.due || "");
  };

  return (
    <>
      <BoardHeader 
        board={board}
        allMembers={allMembers}
        allLabels={allLabels}
        onFilterChange={handleFilterChange}
      />
      
      <BoardClient 
        board={board} 
        allMembers={allMembers} 
        allLabels={allLabels}
        searchQuery={searchQuery}
        filterLabel={filterLabel}
        filterMember={filterMember}
        filterDue={filterDue}
      />
    </>
  );
}
