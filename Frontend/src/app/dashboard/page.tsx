"use client";

import React, { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AutoRunCard } from "@/components/dashboard/AutoRunCard";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { SeedingResultCard } from "@/components/dashboard/SeedingResultCard";
import { RecentRunsCard } from "@/components/dashboard/RecentRunsCard";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import { EditTaskModal } from "@/components/dashboard/EditTaskModal";
import { useDashboardState } from "@/components/dashboard/useDashboardState";

function DashboardContent() {
  const {
    tasks,
    isAutoRunning,
    nowTime,
    copiedKey,
    history,
    toast,
    enabledTasks,
    totalRunsCount,
    latestBackendRun,
    copyToClipboard,
    handleStartAll,
    handleStopAll,
    handleToggleTask,
    handleDeleteTask,
    handleRunTaskImmediately,
    // Edit modal
    editingTask,
    editTargetUrl,
    setEditTargetUrl,
    editProxyUrl,
    setEditProxyUrl,
    editMinDelay,
    setEditMinDelay,
    editMaxDelay,
    setEditMaxDelay,
    editSaving,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    // Create modal
    isCreateModalOpen,
    createTargetUrl,
    setCreateTargetUrl,
    createProxyUrl,
    setCreateProxyUrl,
    createMinDelay,
    setCreateMinDelay,
    createMaxDelay,
    setCreateMaxDelay,
    createSaving,
    handleOpenCreate,
    handleCloseCreate,
    handleSaveCreate,
  } = useDashboardState();

    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 animate-bounce-once">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${toast.type === "success"
                  ? "bg-emerald-900/95 text-emerald-100 border-emerald-700"
                  : "bg-red-900/95 text-red-100 border-red-700"
                }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Top Page Header */}
          <DashboardHeader historyCount={history.length} />

          {/* Auto Run Task Management Card */}
      <AutoRunCard
          isAutoRunning={isAutoRunning}
          enabledTasksCount={enabledTasks.length}
          totalTasksCount={tasks.length}
          totalRunsCount={totalRunsCount}
          onStopAll={handleStopAll}
          onStartAll={handleStartAll}
          onOpenCreate={handleOpenCreate}
        >
            <TaskTable
              tasks={tasks}
              isAutoRunning={isAutoRunning}
              nowTime={nowTime}
              copiedKey={copiedKey}
              onOpenCreate={handleOpenCreate}
              onToggleTask={handleToggleTask}
              onOpenEdit={handleOpenEdit}
              onDeleteTask={handleDeleteTask}
              onRunImmediately={handleRunTaskImmediately}
              onCopy={copyToClipboard}
            />
        </AutoRunCard>

          {/* Results Display Card */}
          <SeedingResultCard
            latestBackendRun={latestBackendRun}
            copiedKey={copiedKey}
            onCopy={copyToClipboard}
          />

          {/* Recent Runs History Card */}
          <RecentRunsCard history={history} />

      {/* Create Task Modal */ }
    <CreateTaskModal
      isOpen={isCreateModalOpen}
      onClose={handleCloseCreate}
      targetUrl={createTargetUrl}
      onTargetUrlChange={setCreateTargetUrl}
      proxyUrl={createProxyUrl}
      onProxyUrlChange={setCreateProxyUrl}
      minDelay={createMinDelay}
      onMinDelayChange={setCreateMinDelay}
      maxDelay={createMaxDelay}
      onMaxDelayChange={setCreateMaxDelay}
      isSaving={createSaving}
      onSubmit={handleSaveCreate}
    />

    {/* Edit Task Modal */ }
    <EditTaskModal
      task={editingTask}
      onClose={handleCloseEdit}
      targetUrl={editTargetUrl}
      onTargetUrlChange={setEditTargetUrl}
      proxyUrl={editProxyUrl}
      onProxyUrlChange={setEditProxyUrl}
      minDelay={editMinDelay}
      onMinDelayChange={setEditMinDelay}
      maxDelay={editMaxDelay}
      onMaxDelayChange={setEditMaxDelay}
      isSaving={editSaving}
      onSubmit={handleSaveEdit}
    />
    </div >
  );
  }

  export default function ProxySeedingPage() {
    return (
      <Suspense
        fallback={
          <div className="p-8 text-center text-gray-400 text-sm">
            Đang tải trang Proxy Tool...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    );
  }
