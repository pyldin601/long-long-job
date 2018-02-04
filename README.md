# long-long-job

[![Build Status](https://travis-ci.org/pldin601/long-long-job.svg?branch=master)](https://travis-ci.org/pldin601/long-long-job)
[![Coverage Status](https://coveralls.io/repos/github/pldin601/long-long-job/badge.svg?branch=master)](https://coveralls.io/github/pldin601/long-long-job?branch=master)

## What?

This module ables you to create a chain of tasks (computations or actions) with ability to resume run state on restart.
Each task receives state of previous task (or initial state if it is first in chain) and must return action what to do next composed with new state.

## Example
