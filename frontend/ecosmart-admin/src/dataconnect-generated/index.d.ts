import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddCommentData {
  comment_insert: Comment_Key;
}

export interface AddCommentVariables {
  taskId: UUIDString;
  content: string;
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateProjectData {
  project_insert: Project_Key;
}

export interface CreateProjectVariables {
  title: string;
  description?: string | null;
}

export interface CreateTaskData {
  task_insert: Task_Key;
}

export interface CreateTaskVariables {
  title: string;
  status: string;
  dueDate: DateString;
  projectId: UUIDString;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface DeleteCommentData {
  comment_delete?: Comment_Key | null;
}

export interface DeleteCommentVariables {
  id: UUIDString;
}

export interface DeleteProjectData {
  project_delete?: Project_Key | null;
}

export interface DeleteProjectVariables {
  id: UUIDString;
}

export interface DeleteTaskData {
  task_delete?: Task_Key | null;
}

export interface DeleteTaskVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface GetCommentData {
  comment?: {
    content: string;
    user: {
      displayName: string;
    };
  };
}

export interface GetCommentVariables {
  id: UUIDString;
}

export interface GetCurrentUserData {
  user?: {
    email: string;
    displayName: string;
  };
}

export interface GetMembershipData {
  membership?: {
    role: string;
    project: {
      title: string;
    };
  };
}

export interface GetMembershipVariables {
  id: UUIDString;
}

export interface GetProjectData {
  project?: {
    title: string;
    owner: {
      displayName: string;
    };
  };
}

export interface GetProjectVariables {
  id: UUIDString;
}

export interface GetTaskData {
  task?: {
    title: string;
    status: string;
    project: {
      title: string;
    };
  };
}

export interface GetTaskVariables {
  id: UUIDString;
}

export interface JoinProjectData {
  membership_insert: Membership_Key;
}

export interface JoinProjectVariables {
  projectId: UUIDString;
  role: string;
}

export interface LeaveProjectData {
  membership_delete?: Membership_Key | null;
}

export interface LeaveProjectVariables {
  id: UUIDString;
}

export interface ListMyProjectsData {
  projects: ({
    title: string;
    createdAt: TimestampString;
  })[];
}

export interface ListProjectMembersData {
  memberships: ({
    user: {
      displayName: string;
    };
    role: string;
  })[];
}

export interface ListProjectMembersVariables {
  projectId: UUIDString;
}

export interface ListProjectTasksData {
  tasks: ({
    title: string;
    dueDate: DateString;
  })[];
}

export interface ListProjectTasksVariables {
  projectId: UUIDString;
}

export interface ListTaskCommentsData {
  comments: ({
    content: string;
    createdAt: TimestampString;
  })[];
}

export interface ListTaskCommentsVariables {
  taskId: UUIDString;
}

export interface ListUsersData {
  users: ({
    displayName: string;
    avatarUrl?: string | null;
  })[];
}

export interface Membership_Key {
  id: UUIDString;
  __typename?: 'Membership_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateCommentData {
  comment_update?: Comment_Key | null;
}

export interface UpdateCommentVariables {
  id: UUIDString;
  content: string;
}

export interface UpdateMembershipData {
  membership_update?: Membership_Key | null;
}

export interface UpdateMembershipVariables {
  id: UUIDString;
  role: string;
}

export interface UpdateProjectData {
  project_update?: Project_Key | null;
}

export interface UpdateProjectVariables {
  id: UUIDString;
  title?: string | null;
}

export interface UpdateTaskData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskVariables {
  id: UUIDString;
  status: string;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface CreateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  operationName: string;
}
export const createProjectRef: CreateProjectRef;

export function createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;
export function createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface UpdateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProjectVariables): MutationRef<UpdateProjectData, UpdateProjectVariables>;
  operationName: string;
}
export const updateProjectRef: UpdateProjectRef;

export function updateProject(vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;
export function updateProject(dc: DataConnect, vars: UpdateProjectVariables): MutationPromise<UpdateProjectData, UpdateProjectVariables>;

interface GetProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectVariables): QueryRef<GetProjectData, GetProjectVariables>;
  operationName: string;
}
export const getProjectRef: GetProjectRef;

export function getProject(vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;
export function getProject(dc: DataConnect, vars: GetProjectVariables, options?: ExecuteQueryOptions): QueryPromise<GetProjectData, GetProjectVariables>;

interface DeleteProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteProjectVariables): MutationRef<DeleteProjectData, DeleteProjectVariables>;
  operationName: string;
}
export const deleteProjectRef: DeleteProjectRef;

export function deleteProject(vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;
export function deleteProject(dc: DataConnect, vars: DeleteProjectVariables): MutationPromise<DeleteProjectData, DeleteProjectVariables>;

interface ListMyProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyProjectsData, undefined>;
  operationName: string;
}
export const listMyProjectsRef: ListMyProjectsRef;

export function listMyProjects(options?: ExecuteQueryOptions): QueryPromise<ListMyProjectsData, undefined>;
export function listMyProjects(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyProjectsData, undefined>;

interface CreateTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  operationName: string;
}
export const createTaskRef: CreateTaskRef;

export function createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;
export function createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface UpdateTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskVariables): MutationRef<UpdateTaskData, UpdateTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskVariables): MutationRef<UpdateTaskData, UpdateTaskVariables>;
  operationName: string;
}
export const updateTaskRef: UpdateTaskRef;

export function updateTask(vars: UpdateTaskVariables): MutationPromise<UpdateTaskData, UpdateTaskVariables>;
export function updateTask(dc: DataConnect, vars: UpdateTaskVariables): MutationPromise<UpdateTaskData, UpdateTaskVariables>;

interface GetTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTaskVariables): QueryRef<GetTaskData, GetTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTaskVariables): QueryRef<GetTaskData, GetTaskVariables>;
  operationName: string;
}
export const getTaskRef: GetTaskRef;

export function getTask(vars: GetTaskVariables, options?: ExecuteQueryOptions): QueryPromise<GetTaskData, GetTaskVariables>;
export function getTask(dc: DataConnect, vars: GetTaskVariables, options?: ExecuteQueryOptions): QueryPromise<GetTaskData, GetTaskVariables>;

interface DeleteTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTaskVariables): MutationRef<DeleteTaskData, DeleteTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTaskVariables): MutationRef<DeleteTaskData, DeleteTaskVariables>;
  operationName: string;
}
export const deleteTaskRef: DeleteTaskRef;

export function deleteTask(vars: DeleteTaskVariables): MutationPromise<DeleteTaskData, DeleteTaskVariables>;
export function deleteTask(dc: DataConnect, vars: DeleteTaskVariables): MutationPromise<DeleteTaskData, DeleteTaskVariables>;

interface ListProjectTasksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListProjectTasksVariables): QueryRef<ListProjectTasksData, ListProjectTasksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListProjectTasksVariables): QueryRef<ListProjectTasksData, ListProjectTasksVariables>;
  operationName: string;
}
export const listProjectTasksRef: ListProjectTasksRef;

export function listProjectTasks(vars: ListProjectTasksVariables, options?: ExecuteQueryOptions): QueryPromise<ListProjectTasksData, ListProjectTasksVariables>;
export function listProjectTasks(dc: DataConnect, vars: ListProjectTasksVariables, options?: ExecuteQueryOptions): QueryPromise<ListProjectTasksData, ListProjectTasksVariables>;

interface AddCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCommentVariables): MutationRef<AddCommentData, AddCommentVariables>;
  operationName: string;
}
export const addCommentRef: AddCommentRef;

export function addComment(vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;
export function addComment(dc: DataConnect, vars: AddCommentVariables): MutationPromise<AddCommentData, AddCommentVariables>;

interface UpdateCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCommentVariables): MutationRef<UpdateCommentData, UpdateCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCommentVariables): MutationRef<UpdateCommentData, UpdateCommentVariables>;
  operationName: string;
}
export const updateCommentRef: UpdateCommentRef;

export function updateComment(vars: UpdateCommentVariables): MutationPromise<UpdateCommentData, UpdateCommentVariables>;
export function updateComment(dc: DataConnect, vars: UpdateCommentVariables): MutationPromise<UpdateCommentData, UpdateCommentVariables>;

interface GetCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCommentVariables): QueryRef<GetCommentData, GetCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCommentVariables): QueryRef<GetCommentData, GetCommentVariables>;
  operationName: string;
}
export const getCommentRef: GetCommentRef;

export function getComment(vars: GetCommentVariables, options?: ExecuteQueryOptions): QueryPromise<GetCommentData, GetCommentVariables>;
export function getComment(dc: DataConnect, vars: GetCommentVariables, options?: ExecuteQueryOptions): QueryPromise<GetCommentData, GetCommentVariables>;

interface DeleteCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCommentVariables): MutationRef<DeleteCommentData, DeleteCommentVariables>;
  operationName: string;
}
export const deleteCommentRef: DeleteCommentRef;

export function deleteComment(vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;
export function deleteComment(dc: DataConnect, vars: DeleteCommentVariables): MutationPromise<DeleteCommentData, DeleteCommentVariables>;

interface ListTaskCommentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTaskCommentsVariables): QueryRef<ListTaskCommentsData, ListTaskCommentsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTaskCommentsVariables): QueryRef<ListTaskCommentsData, ListTaskCommentsVariables>;
  operationName: string;
}
export const listTaskCommentsRef: ListTaskCommentsRef;

export function listTaskComments(vars: ListTaskCommentsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTaskCommentsData, ListTaskCommentsVariables>;
export function listTaskComments(dc: DataConnect, vars: ListTaskCommentsVariables, options?: ExecuteQueryOptions): QueryPromise<ListTaskCommentsData, ListTaskCommentsVariables>;

interface JoinProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: JoinProjectVariables): MutationRef<JoinProjectData, JoinProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: JoinProjectVariables): MutationRef<JoinProjectData, JoinProjectVariables>;
  operationName: string;
}
export const joinProjectRef: JoinProjectRef;

export function joinProject(vars: JoinProjectVariables): MutationPromise<JoinProjectData, JoinProjectVariables>;
export function joinProject(dc: DataConnect, vars: JoinProjectVariables): MutationPromise<JoinProjectData, JoinProjectVariables>;

interface UpdateMembershipRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMembershipVariables): MutationRef<UpdateMembershipData, UpdateMembershipVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMembershipVariables): MutationRef<UpdateMembershipData, UpdateMembershipVariables>;
  operationName: string;
}
export const updateMembershipRef: UpdateMembershipRef;

export function updateMembership(vars: UpdateMembershipVariables): MutationPromise<UpdateMembershipData, UpdateMembershipVariables>;
export function updateMembership(dc: DataConnect, vars: UpdateMembershipVariables): MutationPromise<UpdateMembershipData, UpdateMembershipVariables>;

interface GetMembershipRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMembershipVariables): QueryRef<GetMembershipData, GetMembershipVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMembershipVariables): QueryRef<GetMembershipData, GetMembershipVariables>;
  operationName: string;
}
export const getMembershipRef: GetMembershipRef;

export function getMembership(vars: GetMembershipVariables, options?: ExecuteQueryOptions): QueryPromise<GetMembershipData, GetMembershipVariables>;
export function getMembership(dc: DataConnect, vars: GetMembershipVariables, options?: ExecuteQueryOptions): QueryPromise<GetMembershipData, GetMembershipVariables>;

interface LeaveProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LeaveProjectVariables): MutationRef<LeaveProjectData, LeaveProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LeaveProjectVariables): MutationRef<LeaveProjectData, LeaveProjectVariables>;
  operationName: string;
}
export const leaveProjectRef: LeaveProjectRef;

export function leaveProject(vars: LeaveProjectVariables): MutationPromise<LeaveProjectData, LeaveProjectVariables>;
export function leaveProject(dc: DataConnect, vars: LeaveProjectVariables): MutationPromise<LeaveProjectData, LeaveProjectVariables>;

interface ListProjectMembersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListProjectMembersVariables): QueryRef<ListProjectMembersData, ListProjectMembersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListProjectMembersVariables): QueryRef<ListProjectMembersData, ListProjectMembersVariables>;
  operationName: string;
}
export const listProjectMembersRef: ListProjectMembersRef;

export function listProjectMembers(vars: ListProjectMembersVariables, options?: ExecuteQueryOptions): QueryPromise<ListProjectMembersData, ListProjectMembersVariables>;
export function listProjectMembers(dc: DataConnect, vars: ListProjectMembersVariables, options?: ExecuteQueryOptions): QueryPromise<ListProjectMembersData, ListProjectMembersVariables>;

