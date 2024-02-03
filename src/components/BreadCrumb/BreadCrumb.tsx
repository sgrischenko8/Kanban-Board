import Breadcrumb from 'react-bootstrap/Breadcrumb';

import { Repo } from '../../../@types/custom';
interface BreadcrumbsProps {
  repo: Repo;
}

export const Breadcrumbs = ({ repo }: BreadcrumbsProps) => {
  function getStarsAmount() {
    let rating = 0;
    rating = repo.stars / 1000;
    if (rating < 1) {
      rating = +rating.toFixed(3).toString();
    } else {
      rating = +rating.toFixed(0);
    }
    return rating === 0 ? rating : rating + ' K';
  }

  return (
    <>
      {Object.keys(repo).length > 0 && (
        <div className="d-flex gap-3 p-2">
          <Breadcrumb data-testid="breadcrumb" className="text-capitalize">
            <Breadcrumb.Item
              href={`https://github.com/${repo.owner}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repo.owner}
            </Breadcrumb.Item>

            <Breadcrumb.Item
              href={`https://github.com/${repo.owner}/${repo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repo.repo}
            </Breadcrumb.Item>
          </Breadcrumb>

          <p className="d-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 47.94 47.94"
            >
              <path
                d="M26.285,2.486l5.407,10.956c0.376,0.762,1.103,1.29,1.944,1.412l12.091,1.757
	c2.118,0.308,2.963,2.91,1.431,4.403l-8.749,8.528c-0.608,0.593-0.886,1.448-0.742,2.285l2.065,12.042
	c0.362,2.109-1.852,3.717-3.746,2.722l-10.814-5.685c-0.752-0.395-1.651-0.395-2.403,0l-10.814,5.685
	c-1.894,0.996-4.108-0.613-3.746-2.722l2.065-12.042c0.144-0.837-0.134-1.692-0.742-2.285l-8.749-8.528
	c-1.532-1.494-0.687-4.096,1.431-4.403l12.091-1.757c0.841-0.122,1.568-0.65,1.944-1.412l5.407-10.956
	C22.602,0.567,25.338,0.567,26.285,2.486z"
                fill="#ED8A19"
              />
            </svg>
            {getStarsAmount()} stars
          </p>
        </div>
      )}
    </>
  );
};
0;
