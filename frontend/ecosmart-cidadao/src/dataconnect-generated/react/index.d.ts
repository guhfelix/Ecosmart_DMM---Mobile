import { CreateUserData, UpdateUserData, GetCurrentUserData, DeleteUserData, ListUsersData, CreateProjectData, CreateProjectVariables, UpdateProjectData, UpdateProjectVariables, GetProjectData, GetProjectVariables, DeleteProjectData, DeleteProjectVariables, ListMyProjectsData, CreateTaskData, CreateTaskVariables, UpdateTaskData, UpdateTaskVariables, GetTaskData, GetTaskVariables, DeleteTaskData, DeleteTaskVariables, ListProjectTasksData, ListProjectTasksVariables, AddCommentData, AddCommentVariables, UpdateCommentData, UpdateCommentVariables, GetCommentData, GetCommentVariables, DeleteCommentData, DeleteCommentVariables, ListTaskCommentsData, ListTaskCommentsVariables, JoinProjectData, JoinProjectVariables, UpdateMembershipData, UpdateMembershipVariables, GetMembershipData, GetMembershipVariables, LeaveProjectData, LeaveProjectVariables, ListProjectMembersData, ListProjectMembersVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;

export function useGetCurrentUser(options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
export function useGetCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useCreateProject(options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;
export function useCreateProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;

export function useUpdateProject(options?: useDataConnectMutationOptions<UpdateProjectData, FirebaseError, UpdateProjectVariables>): UseDataConnectMutationResult<UpdateProjectData, UpdateProjectVariables>;
export function useUpdateProject(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProjectData, FirebaseError, UpdateProjectVariables>): UseDataConnectMutationResult<UpdateProjectData, UpdateProjectVariables>;

export function useGetProject(vars: GetProjectVariables, options?: useDataConnectQueryOptions<GetProjectData>): UseDataConnectQueryResult<GetProjectData, GetProjectVariables>;
export function useGetProject(dc: DataConnect, vars: GetProjectVariables, options?: useDataConnectQueryOptions<GetProjectData>): UseDataConnectQueryResult<GetProjectData, GetProjectVariables>;

export function useDeleteProject(options?: useDataConnectMutationOptions<DeleteProjectData, FirebaseError, DeleteProjectVariables>): UseDataConnectMutationResult<DeleteProjectData, DeleteProjectVariables>;
export function useDeleteProject(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteProjectData, FirebaseError, DeleteProjectVariables>): UseDataConnectMutationResult<DeleteProjectData, DeleteProjectVariables>;

export function useListMyProjects(options?: useDataConnectQueryOptions<ListMyProjectsData>): UseDataConnectQueryResult<ListMyProjectsData, undefined>;
export function useListMyProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyProjectsData>): UseDataConnectQueryResult<ListMyProjectsData, undefined>;

export function useCreateTask(options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;
export function useCreateTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;

export function useUpdateTask(options?: useDataConnectMutationOptions<UpdateTaskData, FirebaseError, UpdateTaskVariables>): UseDataConnectMutationResult<UpdateTaskData, UpdateTaskVariables>;
export function useUpdateTask(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTaskData, FirebaseError, UpdateTaskVariables>): UseDataConnectMutationResult<UpdateTaskData, UpdateTaskVariables>;

export function useGetTask(vars: GetTaskVariables, options?: useDataConnectQueryOptions<GetTaskData>): UseDataConnectQueryResult<GetTaskData, GetTaskVariables>;
export function useGetTask(dc: DataConnect, vars: GetTaskVariables, options?: useDataConnectQueryOptions<GetTaskData>): UseDataConnectQueryResult<GetTaskData, GetTaskVariables>;

export function useDeleteTask(options?: useDataConnectMutationOptions<DeleteTaskData, FirebaseError, DeleteTaskVariables>): UseDataConnectMutationResult<DeleteTaskData, DeleteTaskVariables>;
export function useDeleteTask(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteTaskData, FirebaseError, DeleteTaskVariables>): UseDataConnectMutationResult<DeleteTaskData, DeleteTaskVariables>;

export function useListProjectTasks(vars: ListProjectTasksVariables, options?: useDataConnectQueryOptions<ListProjectTasksData>): UseDataConnectQueryResult<ListProjectTasksData, ListProjectTasksVariables>;
export function useListProjectTasks(dc: DataConnect, vars: ListProjectTasksVariables, options?: useDataConnectQueryOptions<ListProjectTasksData>): UseDataConnectQueryResult<ListProjectTasksData, ListProjectTasksVariables>;

export function useAddComment(options?: useDataConnectMutationOptions<AddCommentData, FirebaseError, AddCommentVariables>): UseDataConnectMutationResult<AddCommentData, AddCommentVariables>;
export function useAddComment(dc: DataConnect, options?: useDataConnectMutationOptions<AddCommentData, FirebaseError, AddCommentVariables>): UseDataConnectMutationResult<AddCommentData, AddCommentVariables>;

export function useUpdateComment(options?: useDataConnectMutationOptions<UpdateCommentData, FirebaseError, UpdateCommentVariables>): UseDataConnectMutationResult<UpdateCommentData, UpdateCommentVariables>;
export function useUpdateComment(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCommentData, FirebaseError, UpdateCommentVariables>): UseDataConnectMutationResult<UpdateCommentData, UpdateCommentVariables>;

export function useGetComment(vars: GetCommentVariables, options?: useDataConnectQueryOptions<GetCommentData>): UseDataConnectQueryResult<GetCommentData, GetCommentVariables>;
export function useGetComment(dc: DataConnect, vars: GetCommentVariables, options?: useDataConnectQueryOptions<GetCommentData>): UseDataConnectQueryResult<GetCommentData, GetCommentVariables>;

export function useDeleteComment(options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, DeleteCommentVariables>): UseDataConnectMutationResult<DeleteCommentData, DeleteCommentVariables>;
export function useDeleteComment(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, DeleteCommentVariables>): UseDataConnectMutationResult<DeleteCommentData, DeleteCommentVariables>;

export function useListTaskComments(vars: ListTaskCommentsVariables, options?: useDataConnectQueryOptions<ListTaskCommentsData>): UseDataConnectQueryResult<ListTaskCommentsData, ListTaskCommentsVariables>;
export function useListTaskComments(dc: DataConnect, vars: ListTaskCommentsVariables, options?: useDataConnectQueryOptions<ListTaskCommentsData>): UseDataConnectQueryResult<ListTaskCommentsData, ListTaskCommentsVariables>;

export function useJoinProject(options?: useDataConnectMutationOptions<JoinProjectData, FirebaseError, JoinProjectVariables>): UseDataConnectMutationResult<JoinProjectData, JoinProjectVariables>;
export function useJoinProject(dc: DataConnect, options?: useDataConnectMutationOptions<JoinProjectData, FirebaseError, JoinProjectVariables>): UseDataConnectMutationResult<JoinProjectData, JoinProjectVariables>;

export function useUpdateMembership(options?: useDataConnectMutationOptions<UpdateMembershipData, FirebaseError, UpdateMembershipVariables>): UseDataConnectMutationResult<UpdateMembershipData, UpdateMembershipVariables>;
export function useUpdateMembership(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateMembershipData, FirebaseError, UpdateMembershipVariables>): UseDataConnectMutationResult<UpdateMembershipData, UpdateMembershipVariables>;

export function useGetMembership(vars: GetMembershipVariables, options?: useDataConnectQueryOptions<GetMembershipData>): UseDataConnectQueryResult<GetMembershipData, GetMembershipVariables>;
export function useGetMembership(dc: DataConnect, vars: GetMembershipVariables, options?: useDataConnectQueryOptions<GetMembershipData>): UseDataConnectQueryResult<GetMembershipData, GetMembershipVariables>;

export function useLeaveProject(options?: useDataConnectMutationOptions<LeaveProjectData, FirebaseError, LeaveProjectVariables>): UseDataConnectMutationResult<LeaveProjectData, LeaveProjectVariables>;
export function useLeaveProject(dc: DataConnect, options?: useDataConnectMutationOptions<LeaveProjectData, FirebaseError, LeaveProjectVariables>): UseDataConnectMutationResult<LeaveProjectData, LeaveProjectVariables>;

export function useListProjectMembers(vars: ListProjectMembersVariables, options?: useDataConnectQueryOptions<ListProjectMembersData>): UseDataConnectQueryResult<ListProjectMembersData, ListProjectMembersVariables>;
export function useListProjectMembers(dc: DataConnect, vars: ListProjectMembersVariables, options?: useDataConnectQueryOptions<ListProjectMembersData>): UseDataConnectQueryResult<ListProjectMembersData, ListProjectMembersVariables>;
