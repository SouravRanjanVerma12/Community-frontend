import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';

export function useJobs({ workMode = '', employmentType = '', search = '', postedBy = '' } = {}) {
  return useQuery({
    queryKey: ['jobs', workMode, employmentType, search, postedBy],
    queryFn: async () => {
      const params = { limit: 30 };
      if (workMode)       params.workMode = workMode;
      if (employmentType) params.employmentType = employmentType;
      if (search)          params.search = search;
      if (postedBy)        params.postedBy = postedBy;
      const { data } = await api.get('/jobs', { params });
      return data.jobs;
    },
  });
}

export function useJob(jobId) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}`);
      return data.job;
    },
    enabled: !!jobId,
  });
}

export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: ['jobs', 'my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/mine/applications');
      return data.applications;
    },
    enabled,
  });
}

export function useJobApplicants(jobId, isOwner, enabled = true) {
  return useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}/applicants`);
      return data.applications;
    },
    enabled: enabled && isOwner && !!jobId,
  });
}

export function invalidateJobs() {
  queryClient.invalidateQueries({ queryKey: ['jobs'] });
}

export function invalidateJobApplicants(jobId) {
  queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
}
