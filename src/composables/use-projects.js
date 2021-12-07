import { ref } from 'vue';
import { axios } from './use-axios.js';

const availableProjects = ref([]); // REVIEW: Use shallowRef?
const loadingAvailableProjects = ref(true);
const currentProject = ref(null); // REVIEW: Use shallowRef?

// const getProjects = () => availableProjects.value;

const clearProjects = () => {
  availableProjects.value.length = 0;
};

const addProjects = (projects) => {
  availableProjects.value.push(...projects);
};

const fetchAllProjects = async () => {
  const { data: projects } = await axios.get('projects/project');
  clearProjects();
  addProjects(projects.data);
  loadingAvailableProjects.value = false;
}

// const getCurrentProject = () => currentProject.value;

export {
  availableProjects,
  loadingAvailableProjects,
  currentProject,
  fetchAllProjects,
  // getCurrentProject,
  // getProjects,
};