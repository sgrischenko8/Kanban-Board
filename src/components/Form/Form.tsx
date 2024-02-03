import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';

// import { AppDispatch } from '../../redux/store';
import { selectLoading, selectError } from '../../redux/selectors';
import { Repo } from '../../../@types/custom';

interface FormProps {
  repo: Repo;
  onSubmit: (params: {
    owner: string;
    repo: string;
  }) => Promise<boolean> | boolean;
}

export const Form = ({ repo, onSubmit }: FormProps) => {
  //   const dispatch = useDispatch<AppDispatch>();

  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // --------------  submit form function  -----------------------------
  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const input = target.repoUrl as HTMLInputElement;

    const tempUrlArray = input.value.split('/');

    //-----------check if repo url is valid:
    if (tempUrlArray.length > 4) {
      const params = { owner: tempUrlArray[3], repo: tempUrlArray[4] };

      if (!error && repo.owner === params.owner && repo.repo === params.repo) {
        target.reset();
        return;
      }

      try {
        const ok = await onSubmit(params);
        if (ok) {
          target.reset();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <form
      data-testid="form"
      onSubmit={submitHandler}
      className="w-100 d-flex gap-2 p-2"
    >
      <input
        className="form-control border border-dark rounded-1"
        type="url"
        name="repoUrl"
        id="url"
        placeholder="Enter repo URL"
        pattern="https://github.com/.*/.*"
        title="Enter URL in the format: https://github.com/owner/repo"
        required
      />

      <Button
        type="submit"
        title="Load issues"
        variant="outline-dark"
        className="rounded-0"
        disabled={isLoading}
        onClick={() => false}
      >
        Load issues
      </Button>
    </form>
  );
};
