# long-long-job

## What?

This module ables you to create a chain of tasks (computations or actions) with ability to resume run state on restart.
Each task receives state of previous task (or initial state if it is first in chain) and must return action what to do next composed with new state.

## Example
